import re

with open('content/chapters/4-4-hometree-as-keystone/vi.mdx', 'r') as f:
    vi_content = f.read()

missing_translation = """## Đó thực chất là gì

Vào năm 1972, khi làm việc dưới đáy biển bên dưới lớp băng Nam Cực, một nhà sinh thái học tên là Paul Dayton cần một thuật ngữ cho một loại sinh vật mà khái niệm loài chủ chốt không bao hàm được. Những gì ông liên tục tìm thấy là các loài phong phú tại địa phương, có kích thước vật lý lớn, và *chính chúng đã xây dựng nên nơi đó* — bọt biển và các loài động vật không cuống cồng kềnh khác, mà cơ thể của chúng cấu thành nên môi trường sống cho mọi loài khác trong quần xã. Tầm quan trọng của chúng không hề bất cân xứng với khối lượng của chúng. Tầm quan trọng của chúng *chính là* khối lượng của chúng, cộng với việc mọi thứ khác đều tự sắp xếp xung quanh nơi trú ẩn, bóng râm và bề mặt mà chúng cung cấp. Ông gọi chúng là <GlossaryTerm slug="foundation-species">loài nền tảng (foundation species)</GlossaryTerm>, và cái tên này chính xác theo cái cách mà "loài chủ chốt" không có được: một nền tảng không phải là một viên đá nhỏ bé thông minh chống đỡ cả một mái vòm. Nó là khối lượng khổng lồ ở phía dưới cùng mà mọi thứ khác đang đứng trên đó.

Đặt hai khái niệm này cạnh nhau và sự khác biệt sẽ trở nên rõ ràng.

<Comparison
  left={{
    title: "Loài chủ chốt",
    children: "Hiếm. Chiếm một phần nhỏ sinh khối của quần xã. Tác động từ trên xuống, thường bằng cách ăn thịt một loài nào đó mà nếu không có nó thì sẽ độc chiếm không gian. Tác động của nó vượt xa so với mức độ phong phú của nó — loại bỏ nó và quần xã sẽ tổ chức lại, mặc dù hầu như không có cấu trúc vật lý nào bị tước đi. Sao biển của Paine; rái cá biển. Bảo vệ nó thông qua việc bảo vệ lưới thức ăn.",
  }}
  right={{
    title: "Loài nền tảng",
    children: "Phong phú. Thường chiếm phần lớn sinh khối của quần xã. Tác động bằng cách tồn tại vật lý — cung cấp cấu trúc, bóng râm, độ ẩm, bề mặt, các hốc rỗng, một nơi để trú ngụ. Tác động của nó tỷ lệ thuận với khối lượng, và khối lượng là điểm mấu chốt. Loại bỏ nó và chính môi trường sống sẽ không còn. Tảo bẹ khổng lồ; cây thiết sâm phương Đông; một cái cây cao ba trăm mét. Bảo vệ nó thông qua việc bảo vệ cấu trúc vật lý tích lũy, điều này khó khăn hơn rất nhiều.",
  }}
/>

Có một tên gọi thứ hai, bổ sung cho những gì Hometree làm, và nó xuất phát từ một bài báo năm 1994 của Clive Jones, John Lawton và Moshe Shachak, đã mang lại cho sinh thái học một trong những bộ từ vựng hữu ích nhất: <GlossaryTerm slug="ecosystem-engineer">kỹ sư hệ sinh thái (ecosystem engineer)</GlossaryTerm>, một sinh vật thay đổi môi trường sống của nó về mặt vật lý chứ không chỉ thông qua việc ăn và bị ăn. Họ chia khái niệm này làm hai, và sự phân chia này là phần đáng để ghi nhớ. Một kỹ sư **dị sinh (allogenic)** biến đổi vật chất bên ngoài cơ thể nó — một con hải ly đốn cây và đắp đập ngăn suối, một con giun đất cải tạo đất. Một kỹ sư <GlossaryTerm slug="autogenic-engineer">**tự sinh (autogenic)**</GlossaryTerm> *chính là* sự biến đổi đó: cơ thể sống của chính nó là sự thay đổi cấu trúc mà nó tạo ra cho thế giới. San hô. Tảo bẹ. Cây cối.

Đó là câu nói cần ghi nhớ cho phần còn lại của chương này. Một cái cây lớn không xây dựng một môi trường sống; một cái cây lớn *chính là* một môi trường sống, và nó tạo ra môi trường đó từ chính các mô của mình, một cách chậm chạp, trong suốt cả cuộc đời. Nó hứng lấy ánh sáng và tỏa xuống bóng râm. Nó làm giảm sức gió. Nó giữ lại độ ẩm. Nó hứng mưa và để nước rơi xuống nhẹ nhàng thay vì dội mạnh. Nó rụng vỏ và lá để tạo ra đất bên dưới chính nó. Nó nứt nẻ, mục nát và rỗng ruột, và mỗi sự đổ vỡ đó lại trở thành ngôi nhà của một ai đó. Không có điều nào trong số này là một dịch vụ mà cái cây "thực hiện". Đó đơn giản là những gì mà một khối lượng gỗ lớn đứng tại một chỗ trong một thời gian dài *làm*.
"""

vi_content = vi_content.replace('<FoundationVsKeystone />', missing_translation)

with open('content/chapters/4-4-hometree-as-keystone/vi.mdx', 'w') as f:
    f.write(vi_content)
