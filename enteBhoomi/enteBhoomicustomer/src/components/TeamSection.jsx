import React, { useState } from 'react';

const teamMembers = [
  {
    id: 1,
    name: "Mr. K. Sukumaran Achary",
    designation: "Chief Executive Officer, Punalur Farmers Producer Company Limited",
    image: "/WhatsApp Image 2026-03-13 at 09.39.39.jpeg",
    shortBio: "Retired Senior Marketing Officer, Directorate of Marketing and Inspection (DMI), Department of Agriculture and cooperation, Ministry of Agriculture, Government of India.",
    fullBio: `Mr. K. Sukumaran Achary, Retired Senior Marketing Officer, Directorate of Marketing and Inspection (DMI), Department of Agriculture and cooperation, Ministry of Agriculture, Government of India is a post graduate in Agriculture. He joined the Directorate on 01/12/1981 and was looking after grading and quality control of agricultural commodities including formulation of grades and grade standards, market research of agricultural produce and drafting of technical reports, investigation and survey at field level of marketing conditions in respect of agricultural commodities and collect, compile and interpret the relevant data, Imparting training in agricultural marketing to state agriculture department officials, farmers, entrepreneurs etc.\n\nFrom May 2007, Mr. Achary was posted in DMI Thiruvananthapuram and was the State Nodal officer for the Central sector subsidy schemes in Kerala viz. Rural godown scheme and Scheme for Development/Strengthening of agricultural marketing Infrastructure, Grading and Standardization. As the Nodal officer for the central sector subsidy schemes, Mr. Achary conducted awareness programmes throughout the state and was successful in providing necessary help and guidance to the progressive farmers and entrepreneurs for preparing the Detailed Project Reports (DPR). He implemented projects in agriculture, diary, meat, fisheries and poultry sectors actively coordinating with NABARD, NCDC and Kerala State Agriculture Department.\n\nMr. Achary has done his Master of Science in Agriculture (M.Sc.Agri) in 1979 from the Jawaharlal Nehru Krishi Vishwa Vidyalaya, Jabalpur, Madhya Pradesh. He attended the 3 months In-service training course in agricultural marketing conducted by DMI at Nagpur in 1982 and several in-service trainings in grading of different agricultural commodities including training in quality control of Fruits and Vegetables for export to European Union Countries. In September 2010, he represented DMI in the training programme for Evaluation Committee Members for Assessment of Organic Certification Bodies under National Programme for Organic Production (NPOP) conducted by Agricultural and Processed Food Products Export Development Authority, Ministry of Commerce& Industry, Govt. of India at New Delhi. He published many papers on quality control and marketing of spices.`,
    contact: {
      address: "Kailasamangalam, Maniyar PO, Punalur-691333, Kollam District",
      mob: "9446164182",
      email: "sukukailas53@gmail.com"
    }
  },
  {
    id: 2,
    name: "Dr. G. ANILKUMAR",
    designation: "Founder & Managing Partner - Rohini Agro Science",
    image: "/WhatsApp Image 2026-03-13 at 09.39.40.jpeg",
    shortBio: "A Chemical Engineer by profession with an Executive Programme in Business Management (EBPM) from IIM Lucknow, he is the Founder of Rohini Agro Science established in 2011.",
    fullBio: "A Chemical Engineer by profession with an Executive Programme in Business Management (EBPM) from IIM Lucknow, he is the Founder of Rohini Agro Science, an organic plant growth regulator and bio-stimulants manufacturing company established in 2011. With over 30 years dedicated to research and development in organic farming, he has conducted extensive research in Pune to identify effective solutions for plant growth regulation and soil nourishment. His mission is driven by the motto, “Empower and Educate Farmers to Adopt Organic Farming, Through Which We Can Make a Healthy World.” Through continuous innovation, training, and farmer education, he focuses on providing unique, customer-centric solutions that support sustainable agriculture and the upliftment of farming communities. His work promotes improved crop quality and yield while prioritizing the health and safety of farmers, consumers, and the environment. A passionate organic farmer, successful entrepreneur, and philanthropist, he is committed to social responsibility and environmental conservation. Notably, Rohini Agro Science is the first company in the state of Kerala to receive the G2 License, marking a significant milestone in the organic agricultural sector.",
    contact: {
      address: "Plot No:16, Kinfra Hi-Tech Park (Bio-Tech Zone), Kalamassery, Kochi - 683503 Kerala, India",
    }
  }
];

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <section id="our-team" className="bg-gradient-to-b from-white to-[#f2f7ed] px-4 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-black text-[#151d0c] md:text-4xl lg:text-5xl leading-tight inline-block relative">
            Our Advisors
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-[#5bab00] rounded-full"></div>
          </h2>
          <p className="mt-8 text-lg text-[#4b5f3e] leading-relaxed max-w-3xl mx-auto">
            Our advisors bring together decades of experience in agricultural marketing, chemical engineering, and organic farming to empower farmers and build a healthier world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative overflow-hidden bg-white rounded-3xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2 border border-[#eef4e6]"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                <div className="relative w-full md:w-2/5 aspect-[3/4] md:aspect-auto md:min-h-[300px] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden pointer-events-none"></div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-[#151d0c] group-hover:text-[#5bab00] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm font-bold text-[#5bab00] mt-2 uppercase tracking-wider">
                      {member.designation}
                    </p>
                    <p className="mt-4 text-[#4b5f3e] leading-relaxed line-clamp-4">
                      {member.shortBio}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedMember(member)}
                    className="mt-6 inline-flex items-center gap-2 text-[#5bab00] font-bold hover:gap-3 transition-all"
                  >
                    Read Full Profile
                    <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative mx-auto w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#eef4e6] overflow-hidden my-auto animate-in fade-in zoom-in duration-300">
            {/* Modal Header/Image */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSelectedMember(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-white hover:bg-black/30 transition-colors backdrop-blur-md"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/3 min-h-[400px] relative">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="text-2xl font-black">{selectedMember.name}</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#5bab00] mt-1">
                    {selectedMember.designation.split(',')[0]}
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-2/3 p-8 lg:p-12 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                <div className="border-l-4 border-[#5bab00] pl-6 mb-8">
                  <h3 className="text-3xl font-black text-[#151d0c]">{selectedMember.name}</h3>
                  <p className="text-lg font-bold text-[#5bab00] mt-1">{selectedMember.designation}</p>
                </div>

                <div className="space-y-6 text-[#4b5f3e] leading-relaxed text-lg whitespace-pre-line text-justify">
                  {selectedMember.fullBio}
                </div>

                {selectedMember.contact && (
                  <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-6">
                    <div className="flex items-start gap-4 flex-1 min-w-[250px]">
                      <div className="flex-shrink-0 size-10 rounded-xl bg-[#5bab00]/10 flex items-center justify-center text-[#5bab00]">
                        <span className="material-symbols-outlined">location_on</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#151d0c] uppercase">Contact Address</p>
                        <p className="text-sm mt-1">{selectedMember.contact.address}</p>
                      </div>
                    </div>
                    {selectedMember.contact.mob && (
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 size-10 rounded-xl bg-[#5bab00]/10 flex items-center justify-center text-[#5bab00]">
                          <span className="material-symbols-outlined">call</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#151d0c] uppercase">Mobile</p>
                          <p className="text-sm mt-1">{selectedMember.contact.mob}</p>
                        </div>
                      </div>
                    )}
                    {selectedMember.contact.email && (
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 size-10 rounded-xl bg-[#5bab00]/10 flex items-center justify-center text-[#5bab00]">
                          <span className="material-symbols-outlined">mail</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#151d0c] uppercase">Email</p>
                          <p className="text-sm mt-1">{selectedMember.contact.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
